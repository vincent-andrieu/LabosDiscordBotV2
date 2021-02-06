import { EDrugsList, EStuffList, EVDrugsList, EVStuffList } from "./interfaces/drug-stuff.interface";

export const EXIT_ERROR = 84;

export function isADrug(drug: string): boolean {
    return Object.values(EVDrugsList).includes(drug);
}

export function isAStuff(stuff: string): boolean {
    return Object.values(EVStuffList).includes(stuff);
}

export function isADrugOrStuff(drug: string): boolean {
    return isADrug(drug) || isAStuff(drug);
}

export function getDrugError(option: { drug?: boolean; stuff?: boolean }, drug?: string): string {
    let str = "";

    if (!option.drug && !option.stuff) {
        option = { drug: true, stuff: true };
    }
    if (drug) {
        return drug + " n'est pas une " + (option.drug ? "drogue" + (option.stuff ? " ou une matière première" : "") : "matière première") + ".\n";
    }

    if (option.drug) {
        str = str.concat("Les drogues sont : ");
        Object.values(EVDrugsList).forEach((drugIndex) => str = str.concat("**", drugIndex, "**, "));
        str = str.substring(0, str.length - 2);
        str = str.concat(".\n");
    }
    if (option.stuff) {
        str = str.concat("Les matières premières sont : ");
        Object.values(EVStuffList).forEach((stuffIndex) => str = str.concat("**", stuffIndex, "**, "));
        str = str.substring(0, str.length - 2);
        str = str.concat(".\n");
    }

    return str;
}