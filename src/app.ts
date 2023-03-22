import express, { Application } from "express"
import morgan from "morgan"
import indexRoutes from './routes/index.routes'
import usersRouter from "./routes/user.routes";


export class App {
    private app: Application;

    constructor(port: number) {
        this.app = express();

        this.settings(port);
        this.middlewares();
        this.routes();
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
        this.app.use(express.urlencoded({ extended: false })) //this is necesary
        this.app.use(express.json())
    }

    private routes() {
        this.app.use(indexRoutes);
        this.app.use('/users', usersRouter)
    }

    //#endregion
}