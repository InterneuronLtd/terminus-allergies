export class SNOMED{
  private _term: string = "";
  private _code: string = "";
  get term(): string{
      return this._term
  };
  set term(v:string){
      this._term = v;
      this.bindingValue = `${this.code} | ${this.term}`;
  }
  fsn: string;
  get code(): string{
      return this._code;
  };
  set code(v:string){
      this._code = v;
      this.bindingValue = `${this.code} | ${this.term}`;
  }
  parentCode: string;
  level: string;
  bindingValue: string = "";
}
