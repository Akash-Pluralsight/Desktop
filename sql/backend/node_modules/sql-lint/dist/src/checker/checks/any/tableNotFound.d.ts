import { Query } from "../../../reader/query";
import { CheckerResult } from "../../checkerResult";
import { IChecker } from "../../interface";
import { Check } from "../../check";
declare class TableNotFound extends Check implements IChecker {
    message: string;
    additionalInformation: string;
    appliesTo: string[];
    requiresConnection: boolean;
    tables: string[];
    constructor(tables: any[]);
    check(query: Query): CheckerResult;
    private cleanTables;
}
export { TableNotFound };
