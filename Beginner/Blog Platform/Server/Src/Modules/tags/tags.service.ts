import type {
  createTagDTO,
  Tag,
  TagRepository,
  TagService,
  updateTagDTO,
} from "./tags.types.js";

export class TagServ implements TagService {
  constructor(private tagRepo: TagRepository) {}

  async createTag(tagData: createTagDTO): Promise<Tag> {
    try {
      if (!tagData.name) throw new Error("Tag name must be provided");

      const newTag = await this.tagRepo.createTag(tagData);

      return newTag;
    } catch (error) {
      throw error;
    }
  }
  async editTag(tagData: updateTagDTO): Promise<Tag> {
    try {
      if (!tagData.id) throw new Error("Tag id must be provided");

      const patchedTag = await this.tagRepo.editTag(tagData);

      return patchedTag;
    } catch (error) {
      throw error;
    }
  }
  async getTags(): Promise<Tag[]> {
    try {
      const tags = await this.tagRepo.getTags();

      return tags;
    } catch (error) {
      throw error;
    }
  }
}
