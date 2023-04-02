import express, { Application, NextFunction, Response, Request } from "express"
import morgan from "morgan"
import indexRoutes from './routes/index.routes'
import usersRouter from "./routes/user.routes";
import { ErrorRest } from "./error";
import { ErrorHandler } from "./errorHandler";
import { HttpStatus } from "./httpStatus";



export class App {
    private app: Application;
    private errorHandler: ErrorHandler;

    constructor(port: number) {
        this.app = express();

        this.errorHandler = new ErrorHandler();

        this.settings(port);
        this.middlewares();
        this.routes();
        this.app.use(this.middlewareErrorHandler);
    }

    //#region public

    //start server
    async listen() {
        await this.app.listen(this.app.get('port')) //this operation may take time
        //this is not done untill previous step with await is done
        console.log("server started at port: " + this.app.get('port'));

    }

    //#endregion


    //#region private

    private settings(port: number) {
        this.app.set('port', port);
    }

    private middlewares() {
        this.app.use(morgan('dev'));
        this.app.use(express.urlencoded({ extended: false })); //this is necesary
        this.app.use(express.json());
    }

    private routes() {
        this.app.use(indexRoutes);
        this.app.use('/users', usersRouter)
    }

    private async middlewareErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
        console.log('middleware error handler');

        if (err instanceof ErrorRest) {
            console.log('was an rest error');

            return res.status(err.status).send(err.serializeError());
        }
        else {
            return res.status(HttpStatus.InternalServerError).send('Internal server error');
        }
    }



    //#endregion
}


