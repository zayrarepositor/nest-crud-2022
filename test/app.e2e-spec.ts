/* import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it("/ (GET)", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect("Hello World!");
  });
}); */
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import * as pactum from "pactum";
import { PrismaService } from "../src/prisma/prisma.service";
import { AppModule } from "../src/app.module";
import { AuthDto } from "../src/auth/dto";
import { EditUserDto } from "src/user/dto";
import { CreateBookmarkDto, EditBookmarkDto } from "../src/bookmark/dto";

describe("App e2e", () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      })
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);

    await prisma.cleanDb();

    pactum.request.setBaseUrl("http://localhost:3333");
  });

  afterAll(() => {
    app.close();
  });

  describe("Auth", () => {
    const dto: AuthDto = {
      firstName: "user",
      lastName: "test",
      email: "test@mail.com",
      password: "123",
    };

    describe("Signup", () => {
      it("Should throw if email is missing", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({
            firsName: dto.firstName,
            lastName: dto.lastName,
            password: dto.password,
          })
          .expectStatus(400);
        /*           .inspect(); */
      });
      it("Should throw if password is missing", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody({
            firsName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
          })
          .expectStatus(400);
      });

      it("Should throw if no body is provided", () => {
        return pactum.spec().post("/auth/signup").expectStatus(400);
      });

      it("Should signup", () => {
        return pactum
          .spec()
          .post("/auth/signup")
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe("Signin", () => {
      it("Should throw if email is missing", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it("Should throw if password is missing", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it("Should throw if no body is provided", () => {
        return pactum.spec().post("/auth/signin").expectStatus(400);
      });

      it("Should signin", () => {
        return pactum
          .spec()
          .post("/auth/signin")
          .withBody({
            password: dto.password,
            email: dto.email,
          })
          .expectStatus(200)
          .stores("userAt", "access_token");
      });
    });
  });
  describe("User", () => {
    describe("Get me", () => {
      it("Should get current user", () => {
        return pactum
          .spec()
          .get("/users/me")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200);
      });
    });
    describe("Edit user", () => {
      it("Should edit user", () => {
        const dto: EditUserDto = {
          firstName: "userEdited",
          email: "edited@mail.com",
        };
        return pactum
          .spec()
          .patch("/users")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe("Bookmarks", () => {
    describe("Get empty bookmarks", () => {
      it("Should get bookmarks", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe("Create bookmark", () => {
      const dto: CreateBookmarkDto = {
        title: "El Principe - Nicolas Maquiavelo",
        link: "https://ocw.uca.es/pluginfile.php/1491/mod_resource/content/1/El_principe_Maquiavelo.pdf",
        description:
          "A diplomatic advice about the world, to someone with potential power",
      };
      it("Should create a bookmark", () => {
        return pactum
          .spec()
          .post("/bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .withBody(dto)
          .expectStatus(201)
          .stores("bookmarkId", "id");
      });
    });
    describe("Get bookmarks", () => {
      it("Should get bookmarks", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
    describe("Get bookmark by id", () => {
      it("Should get bookmark by id", () => {
        return pactum
          .spec()
          .get("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .expectBodyContains("$S{bookmarkId}");
      });
    });
    describe("Edit bookmark by id", () => {
      const dto: EditBookmarkDto = {
        title: "The Prince - Nicolas Maquiavelo",
      };
      it("Should edit bookmark by id", () => {
        return pactum
          .spec()
          .patch("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains("$S{bookmarkId}")
          .expectBodyContains(dto.title);
      });
    });
    describe("Delete bookmark by id", () => {
      it("Should delete bookmark by id", () => {
        return pactum
          .spec()
          .delete("/bookmarks/{id}")
          .withPathParams("id", "$S{bookmarkId}")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(204)
          .inspect();
      });

      it("Should get empty bookmarks", () => {
        return pactum
          .spec()
          .get("/bookmarks")
          .withHeaders({
            Authorization: "Bearer $S{userAt}",
          })
          .expectStatus(200)
          .expectJsonLength(0);
      });
    });
  });
});
