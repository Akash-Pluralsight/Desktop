import { Query } from "../reader/query";
import { CheckerResult } from "./checkerResult";
import { IChecker } from "./interface";
import { Check } from "./check";
declare class NullChecker extends Check implements IChecker {
    message: string;
    requiresConnection: boolean;
    appliesTo: never[];
    additionalInformation: string;
    check(query: Query): CheckerResult;
}
export { NullChecker };
