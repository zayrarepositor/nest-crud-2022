import {
  Controller,
  Delete,
  Get,
  Body,
  Patch,
  Post,
  UseGuards,
  Param,
  HttpCode,
} from "@nestjs/common";
import { ParseIntPipe } from "@nestjs/common/pipes";
import { GetUser } from "../auth/decorators";
import { JwtGuard } from "../auth/guard";
import { BookmarkService } from "./bookmark.service";
import { CreateBookmarkDto, EditBookmarkDto } from "./dto";

@UseGuards(JwtGuard)
@Controller("bookmarks")
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}

  @Get()
  getBookmarks(@GetUser("id") userId: number) {
    return this.bookmarkService.getBookmarks(userId);
  }

  @Get(":id")
  getBookmarkById(
    @GetUser("id") userId: number,
    @Param("id", ParseIntPipe) bookmarkId: number
  ) {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  @Post()
  createBookmark(
    @GetUser("id") userId: number,
    @Body() dto: CreateBookmarkDto
  ) {
    return this.bookmarkService.createBookmark(userId, dto);
  }

  @Patch(":id")
  editBookmarkById(
    @GetUser("id") userId: number,
    @Param("id", ParseIntPipe) bookmarkId: number,
    @Body() dto: EditBookmarkDto
  ) {
    return this.bookmarkService.editBookmarkById(userId, dto, bookmarkId);
  }

  @HttpCode(204)
  @Delete(":id")
  deleteBookmarkById(
    @GetUser("id") userId: number,
    @Param("id", ParseIntPipe) bookmarkId: number
  ) {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
