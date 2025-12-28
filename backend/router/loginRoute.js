import express from 'express';
import LoginController from '../controllers/LoginController.js';

const loginRoute = express.Router();
const loginInstance = new LoginController();

loginRoute.post('/', loginInstance.login);
loginRoute.get('/token-verify', loginInstance.tokenVerify);
export default loginRoute;
