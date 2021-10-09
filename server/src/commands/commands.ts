import { CCommand } from "@interfaces/command.class";
import { LaboratorySchema } from "@schemas/laboratories.schema";
import { ProductionSchema } from "@schemas/productions.schema";
import { StockSchema } from "@schemas/stocks.schema";
import { ServerSchema } from "@schemas/servers.schema";
import { LocationSchema } from "@schemas/locations.schema";
import { serverConfig } from "../server.config";

import LaboratorySetDefaultLabo from "./laboratory/setDefaultLabo";
import LaboratoryAddLabo from "./laboratory/addLabo";
import LaboratoryDelLabo from "./laboratory/delLabo";
import LaboratoryInfoLabo from "./laboratory/infoLabo";
import LaboratoryAddLaboStock from "./laboratory/addLaboStock";
import LaboratoryDelLaboStock from "./laboratory/delLaboStock";
import ProductionAddProd from "./production/addProd";
import ProductionDelProd from "./production/delProd";
import ProductionInfoProd from "./production/infoProd";
import StockAddStockLoc from "./stock/addStockLoc";
import StockDelStockLoc from "./stock/delStockLoc";
import StockAddStock from "./stock/addStock";
import StockDelStock from "./stock/delStock";
import StockSetStock from "./stock/setStock";
import StockInfoStock from "./stock/infoStock";
import ServerSetDefaultChannel from "./server/setDefaultChannel";
import ServerSetLocationsChannel from "./server/setLocationsChannel";
import ServerSetUrl from "./server/setUrl";
import ServerSetPassword from "./server/setPassword";
import ServerSetReminder from "./server/setReminder";
import ServerSetRoleTag from "./server/setRoleTag";
import LocationAdd from "./location/addLoc";
import LocationDel from "./location/delLoc";
import LocationInfo from "./location/infoLoc";
import LocationAddReminder from "./location/addLocReminder";
import LocationDelReminder from "./location/delLocReminder";
import LocationSetTag from "./location/setTag";
import Sockets from "init/sockets";

export default function getCommandsList(socketService: Sockets): Array<CCommand<LaboratorySchema | ProductionSchema | StockSchema | ServerSchema | LocationSchema>> {
    return [
        new LaboratorySetDefaultLabo(socketService, "Modifier le laboratoire par défaut", "**Nom**"),
        new LaboratoryAddLabo(socketService, "Ajoute un laboratoire", "**Nom**, **Drogue**, Screen URL"),
        new LaboratoryDelLabo(socketService, "Supprime un laboratoire", "**Nom**, Raison"),
        new LaboratoryInfoLabo(socketService, "Affiche la liste des laboratoire", "Nom"),
        new LaboratoryAddLaboStock(socketService, "Ajoute un entrepôt à un laboratoire", "**Nom du laboratoire**, **Nom de l'entrepôt**"),
        new LaboratoryDelLaboStock(socketService, "Supprime un entrepôt d'un laboratoire", "**Nom du laboratoire**, **Nom de l'entrepôt**"),

        new ProductionAddProd(socketService, "Ajoute une production", "**Quantité**, Laboratoire, Description"),
        new ProductionDelProd(socketService, "Supprime toute les productions", "Laboratoire, Raison"),
        new ProductionInfoProd(socketService, "Affiche la liste des productions en cours", "Nom du laboratoire"),

        new StockAddStockLoc(socketService, "Ajoute un entrepôt", "**Nom**, **Drogue**, Screen URL"),
        new StockDelStockLoc(socketService, "Supprime un entrepôt", "**Nom**, Raison"),
        new StockAddStock(socketService, "Ajoute de la marchandise dans un entrepôt", "**Nom**, **Quantité**, Raison"),
        new StockDelStock(socketService, "Supprime de la marchandise dans un entrepôt", "**Nom**, **Quantité**, Raison"),
        new StockSetStock(socketService, "Modifie la marchandise d'un entrepôt", "**Nom**, **Quantité**, Raison"),
        new StockInfoStock(socketService, "Affiche la liste des entrepôts", "Nom"),

        new ServerSetDefaultChannel(socketService, "Modifier le channel par défaut"),
        new ServerSetLocationsChannel(socketService, "Modifier le channel pour les locations"),
        new ServerSetUrl(socketService, "Modifier l'URL du site", "**URL**"),
        new ServerSetPassword(socketService, "Modifier le mot de passe", "**Mot de passe**"),
        new ServerSetReminder(socketService, "Modifier le rappel d'une production", "**Minutes**"),
        new ServerSetRoleTag(socketService, "Modifier le rôle qui gère les laboratoires", "**Tag du rôle**"),

        new LocationAdd(socketService, "Ajouter une location", "**Nom**, **Date (" + serverConfig.commands.dateFormat + ")**, Screen URL"),
        new LocationDel(socketService, "Supprimer une location", "**Nom**, Raison"),
        new LocationInfo(socketService, "Affiche la liste des locations", "Nom"),
        new LocationAddReminder(socketService, "Ajoute un rappel pour une location", "**Nom**, **Date (" + serverConfig.commands.dateFormat + ")**"),
        new LocationDelReminder(socketService, "Supprime un rappel pour une location", "**Nom**, **Date (" + serverConfig.commands.dateFormat + ")**"),
        new LocationSetTag(socketService, "Personne ou rôle à tag pour les rappels", "**Nom**, **Tag**")
    ];
}