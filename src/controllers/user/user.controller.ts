import { authService } from "@/services/firebase/auth.service"
import { handlerResponse } from "@/errors/handler"
import { send } from "@/interfaces/api.interface"
import ErrorAPI from "@/errors"

import { Request, Response } from "express"

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body
    const result = await authService.verifyCredentials(email, password)
    if (!result.success) throw new ErrorAPI(result.error)
    return send(res, 200, { data: result })
  } catch (e) { handlerResponse(res, e, 'crear usuario') }
}