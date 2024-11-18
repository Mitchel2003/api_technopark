import { authService as authFB } from "@/services/firebase/auth.service"
import { handlerResponse } from "@/errors/handler"
import { send } from "@/interfaces/api.interface"
import ErrorAPI from "@/errors"

import { Request, Response } from "express"

/**
 * Verifica el token de acceso del usuario (autenticación).
 * Extrae las credenciales del token (id_user), en caso de que token sea invalido, no se permitirá el acceso.
 * @returns {Promise<void>} - Envía los datos del usuario autenticado o un mensaje de error.
 */
export const verifyAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await authFB.verifyCredentials(req.body.token, '');
    if (user.success) return send(res, 400, { data: false })
    if (user.error.message === 'Credenciales inválidas') return send(res, 200, { data: true })
    return send(res, 400, { data: false })
  } catch (e) { handlerResponse(res, e, 'verificar autenticación') }
}

/**
 * Verifica la acción del usuario (registro).
 * La solicitud puede ser de tipo verificación de correo electrónico o de cambio de contraseña.
 * @param {Request} req - Objeto de solicitud Express. Debe contener los datos de la solicitud en body y el modo de verificación en params.
 * @returns {Promise<void>} - Envía un mensaje de confirmación.
 * @link https://github.com/Mitchel2003/rest-api/blob/main/README.md#004
 * @example
 * "verifyEmail" => uid, email, username y role.
 * "resetPassword" => oobCode y password.
 */
export const verifyAction = async ({ body, params }: Request, res: Response): Promise<void> => {
  try {
    const result = params.mode === 'verifyEmail'
      ? await authFB.validateEmailVerification()
      : await authFB.validateResetPassword(body.oobCode, body.password)
    //send response
    if (!result.success) throw new ErrorAPI(result.error);
    return send(res, 200, { data: 'acción completada' })
  } catch (e) { handlerResponse(res, e, 'verificar acción') }
}

/*--------------------------------------------------ResetPassword--------------------------------------------------*/
/**
 * Maneja el proceso de restablecimiento de contraseña.
 * Establece un token de restablecimiento de contraseña para el usuario
 * Envia un email con el token de restablecimiento de contraseña el cual expirará en 1 hora.
 * @returns {Promise<void>} - Envía un mensaje de éxito si el email se envía correctamente.
 */
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await authFB.sendEmailResetPassword(req.body.email);
    if (!result.success) throw new ErrorAPI(result.error);
    return send(res, 200, { data: 'correo de restablecimiento enviado' })
  } catch (e) { handlerResponse(res, e, 'envio de correo de restablecimiento de contraseña') }
}

/**
 * Nos permite actualizar la contraseña del usuario.
 * Valida un token y su respectiva expiración.
 * Envia un email de éxito si la contraseña se actualiza correctamente.
 * @returns {Promise<void>} - Envía un mensaje de éxito si la contraseña se actualiza correctamente, caso contrario un mensaje de error.
 */
export const resetPassword = async ({ params, body }: Request, res: Response): Promise<void> => {
  try {
    const result = await authFB.validateResetPassword(params.oobCode, body.password);
    if (!result.success) throw new ErrorAPI(result.error);
    return send(res, 200, { data: 'Contraseña restablecida correctamente' })
  } catch (e) { handlerResponse(res, e, 'validar restablecimiento de contraseña') }
}
/*---------------------------------------------------------------------------------------------------------*/