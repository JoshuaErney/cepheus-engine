// Ships have no characteristics, so the global initiative formula
// ("2d6 + @characteristics.dex.dm") cannot apply to them. In the combat
// tracker they roll a flat 2d6; the SRD's situational modifiers (Thrust
// advantage, Captain's Tactics Effect) are applied via the ship sheet's
// Roll Initiative button, which prompts for them.
export class CepheusCombatant extends Combatant {
  _getInitiativeFormula() {
    if (this.actor?.type === "ship") return "2d6";
    return super._getInitiativeFormula();
  }
}
