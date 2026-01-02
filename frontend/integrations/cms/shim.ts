export namespace items {
  export type WixDataItem = { _id?: string; [k: string]: any };
  export type WixDataResult<T = any> = { items: T[] };
}

const inMemory: Record<string, items.WixDataItem[]> = {};

export const items = {
  async insert(collectionId: string, itemData: Record<string, any>) {
    inMemory[collectionId] = inMemory[collectionId] || [];
    const id = `id_${Date.now()}`;
    const item = { _id: id, ...itemData };
    inMemory[collectionId].push(item);
    return item;
  },
  async insertReference(_collectionId: string, _propertyName: string, _itemId: string, _refIds: string[]) {
    // no-op shim
    return;
  },
  query(collectionId: string) {
    return {
      include: () => ({
        find: async () => ({ items: inMemory[collectionId] || [] }),
      }),
      find: async () => ({ items: inMemory[collectionId] || [] }),
      eq: function (_k: string, _v: string) { return this; }
    };
  },
  async update(collectionId: string, mergedData: items.WixDataItem) {
    const arr = inMemory[collectionId] || [];
    const idx = arr.findIndex((i) => i._id === mergedData._id);
    if (idx >= 0) arr[idx] = { ...arr[idx], ...mergedData };
    return mergedData;
  },
  async remove(_collectionId: string, _itemId: string) {
    return {} as any;
  }
};
