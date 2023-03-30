import { HttpStatus } from "./httpStatus";

export class ErrorRest extends Error {
    public readonly status: number;

    constructor(error: { status: number, message: string }) {
        super(error.message);
        this.status = error.status;

        Object.setPrototypeOf(this, new.target.prototype);
        this.name = Error.name;
        Error.captureStackTrace(this);
    }
}

export class BadRequestError extends ErrorRest {
    public readonly propertyName;

    constructor(propertyName: string) {
        super({ status: HttpStatus.BadRequest, message: 'Request was wrong format, expected property ' + propertyName })
        this.propertyName = propertyName
    }

}

export class NotFoundError extends ErrorRest {
    public readonly propertyName: string;

    constructor(propertyName: string, detail: string) {
        super({ status: HttpStatus.NotFound, message: 'Property ' + propertyName + ' not found.' });
        this.propertyName = propertyName;
    }
}