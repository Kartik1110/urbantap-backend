import { Router } from 'express';
import { signup, login } from '../controllers/auth.controller';
import { validateSchema } from '../middlewares/validate.middleware';
import { userSchema, loginSchema } from '../schemas/user.schema';

const router = Router();

router.post('/signup', validateSchema(userSchema), signup);
router.post('/login', validateSchema(loginSchema), login);

export default router;
