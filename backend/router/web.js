import express from "express";
import RouteMiddleware from "../middleware/RouteMiddleware.js";
import userRoute from "./userRoute.js";
import loginRoute from "./loginRoute.js";
import registerRoute from "./registerRoute.js";
import categoryRoute from "./categoryRoute.js";
import itemRoute from "./itemRoute.js";
import bookingRoute from "./bookingRoute.js";
import reviewRoute from "./reviewRoute.js";


const auth = new RouteMiddleware();


const webRouter = express.Router();
webRouter.get('/', (req, res) => {
    res.send('We are learning express');
});

webRouter.use('/user',auth.check, userRoute);
webRouter.use('/login', loginRoute);
webRouter.use('/register', registerRoute);
webRouter.use('/categories', categoryRoute);
webRouter.use('/items', itemRoute);
webRouter.use('/bookings', bookingRoute);
webRouter.use('/reviews', reviewRoute);
// payments removed — payment routes deleted



export default webRouter;