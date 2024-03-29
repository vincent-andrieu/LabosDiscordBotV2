import { EDrugsList, EStuffList } from "./interfaces/drug-stuff.interface";

export const GlobalConfig = {
    productions: {
        getProdEmoji: '✅',
        timeoutMinutes: 60,
        drugs: {
            [EDrugsList.COKE]: {
                table: 3,
                recipe : [
                    { name: EStuffList.COCA, quantity: 25, needAll: false },
                    { name: EStuffList.ACIDE, quantity: 12, needAll: true }
                ]
            },
            [EDrugsList.METH]: {
                table: 1,
                recipe : [
                    { name: EStuffList.PHOSPHORE, quantity: 50, needAll: false },
                    { name: EStuffList.ACIDE, quantity: 50, needAll: false },
                    { name: EStuffList.METHY, quantity: 12, needAll: true }
                ]
            },
            [EDrugsList.WEED]: {
                table: 6,
                recipe : [
                    { name: EStuffList.PLANT, quantity: 25, needAll: false },
                    { name: EStuffList.TERRE, quantity: 12, needAll: true }
                ]
            }
        }
    },
    locations: {
        dateFormat: "D MMMM YYYY à H:m"
    }
};