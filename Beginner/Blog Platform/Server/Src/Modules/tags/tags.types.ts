export type Tag = {
  id: string;
  name: string;
};

export type createTagDTO = Omit<Tag, "id">;
export type updateTagDTO = Pick<Tag, "id"> & Partial<Tag>;

export interface TagRepository {
  createTag: (tagData: createTagDTO) => Promise<Tag>;
  editTag: (tagData: updateTagDTO) => Promise<Tag>;
  getTags: () => Promise<Tag[]>;
}
export interface TagService {
  createTag: (tagData: createTagDTO) => Promise<Tag>;
  editTag: (tagData: updateTagDTO) => Promise<Tag>;
  getTags: () => Promise<Tag[]>;
}
