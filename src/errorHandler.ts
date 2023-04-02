import { ErrorRest } from "./error";

//internal server errors
export class ErrorHandler {

    public async handleError(err: Error) {
        //TODO: use bunyan to log error, consider other actions
    }

    public isTrustedError(err: Error): boolean {
        //TODO: implement internal server errors
        return false;
    }
}