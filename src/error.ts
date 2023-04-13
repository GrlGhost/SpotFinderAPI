import { HttpStatus } from "./httpStatus";

//TODO: move errors to folder.

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
        return {
            'name': this.name,
            'status': this.status,
            'message': this.message,
            'property': this.propertyName
        };
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

export class BadRequestGeoBoxError extends ErrorRest {
    public readonly propertyNameMin;
    public readonly propertyNameMax;

    constructor(operational: boolean, propertyNameMin: string, propertyNameMax: string) {
        super({
            status: HttpStatus.BadRequest, message: 'Request was wrong format, expected property ' + propertyNameMin +
                ' to be <= to ' + propertyNameMax
        })
        this.propertyNameMin = propertyNameMin;
        this.propertyNameMax = propertyNameMax;
        this.name = BadRequestError.name;
    }

    public override serializeError(): {} {
        return {
            'name': this.name,
            'status': this.status,
            'message': this.message,
            'property min': this.propertyNameMin,
            'property max': this.propertyNameMax
        };
    }
}

export class BadRequestGeoBoxOutOfBoundsError extends ErrorRest {
    public readonly propertyName;
    public readonly minValue: number;
    public readonly maxValue: number;

    constructor(operational: boolean, propertyName: string, minValue: number, maxValue: number) {
        super({
            status: HttpStatus.BadRequest, message: 'Request was wrong format, expected property ' + propertyName +
                ' value to be between ' + minValue + ' and ' + maxValue
        })
        this.propertyName = propertyName;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.name = BadRequestError.name;
    }

    public override serializeError(): {} {
        return {
            'name': this.name,
            'status': this.status,
            'message': this.message,
            'property': this.propertyName,
            'minimun value': this.minValue,
            'maximun value': this.maxValue
        };
    }

}

export class PassWordMissMatch extends ErrorRest {
    public readonly propertyName;

    constructor(operational: boolean) {
        super({ status: HttpStatus.BadRequest, message: 'Password didnt matched.' })
        this.propertyName = 'psw';
        this.name = PassWordMissMatch.name;
    }

    public override serializeError(): {} {
        return {
            'name': this.name,
            'status': this.status,
            'message': this.message,
            'property': this.propertyName
        };
    }
}

export class Unauthorize extends ErrorRest {
    public readonly cause;

    constructor(operational: boolean, cause: string) {
        super({ status: HttpStatus.Unauthorised, message: 'Does not have authoritation, cause: ' + cause })
        this.cause = cause;
        this.name = Unauthorize.name;
    }

    public override serializeError(): {} {
        return {
            'name': this.name,
            'status': this.status,
            'message': this.message,
            'action': this.cause
        };
    }

}