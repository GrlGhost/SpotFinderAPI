import { HttpStatus } from "./httpStatus";

///Errors that must be reported to the user
export class ErrorRest extends Error {
    public readonly status: number;

    constructor(error: { status: number, message: string }) {
        super(error.message);
        this.status = error.status;

        Object.setPrototypeOf(this, new.target.prototype);
        this.name = Error.name;
        Error.captureStackTrace(this);
    }

    public serializeError(): {} {
        return { 'name': this.name, 'status': this.status, 'message': this.message };
    }
}

export class BadRequestError extends ErrorRest {
    public readonly propertyName;

    constructor(operational: boolean, propertyName: string) {
        super({ status: HttpStatus.BadRequest, message: 'Request was wrong format, expected property ' + propertyName })
        this.propertyName = propertyName;
        this.name = BadRequestError.name;
    }

    public override serializeError(): {} {
        return { 'name': this.name, 'status': this.status, 'message': this.message, 'property': this.propertyName };
    }

}

export class NotFoundError extends ErrorRest {
    public readonly propertyName: string;

    constructor(operational: boolean, propertyName: string) {
        super({ status: HttpStatus.NotFound, message: 'Property ' + propertyName + ' not found.' });
        this.propertyName = propertyName;
        this.name = NotFoundError.name;
    }
}