export abstract class StorageService<T> {
  protected abstract _storageKey: string;
  protected _storage: Storage = window.localStorage;

  protected abstract default: T;

  protected _get(): T {
    try {
      return <T>JSON.parse(this._storage.getItem(this._storageKey) ?? "");
    }
    catch {
      return this.default;
    }
  }

  public get(): T {
    return this._get() ?? this.default;
  }

  public save(value: T) {
    this._storage.setItem(this._storageKey, JSON.stringify(value));
  }
}
