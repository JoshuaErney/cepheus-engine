export class CepheusItem extends Item {
  prepareDerivedData() {
    super.prepareDerivedData();
  }

  get isPhysical() {
    return ["weapon", "armor", "equipment", "augment"].includes(this.type);
  }
}
