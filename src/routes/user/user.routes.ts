import validateSchema from "@/middlewares/validator.middleware"
import authRequired from "@/middlewares/auth.middleware"
import { userSchema } from "@/schemas/user/user.schema"
import { Router } from "express"

import { createUser } from "@/controllers/user/user.controller"

const router = Router()

router.post('/user', authRequired, validateSchema(userSchema), createUser)

export default router