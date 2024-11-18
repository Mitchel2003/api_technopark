/** Este módulo proporciona funciones para la autenticación y gestión de usuarios */
import { databaseService as databaseFB } from "@/services/firebase/database.service"
import { storageService as storageFB } from "@/services/firebase/storage.service"
import { authService as authFB } from "@/services/firebase/auth.service"
import { generateAccessToken } from "@/services/jwt"

import { handlerResponse, normalizeError } from "@/errors/handler"
import ErrorAPI, { Unauthorized } from "@/errors"
import { send } from "@/interfaces/api.interface"

import { Request, Response } from "express"

/**
 * Maneja el proceso de inicio de sesión del usuario.
 * @param {Request} req - Objeto de solicitud Express. Debe contener email y password en el body.
 * @argument photoURL - Hace parte del profile del usuario autenticado (lo usamos para la verificacion de email)
 * @returns {Promise<void>} - Envía el usuario autenticado o un mensaje de error.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authFB.verifyCredentials(email, password);
    if (!result.success) throw new ErrorAPI(result.error);
    if (!result.data.user.photoURL) throw new Unauthorized({ message: 'Email no verificado' });

    const user = result.data.user.email;
    const token = await generateAccessToken({ id: user });
    setCookies(res, token);
    send(res, 200, result.data.user);
  } catch (e: unknown) {
    const res = normalizeError(e, 'inicio de sesión')
    throw new ErrorAPI(res)
  }
}
/**
 * Maneja el proceso de registro de un nuevo usuario.
 * @param {Request} req - Objeto de solicitud Express. Debe contener los datos del nuevo usuario en el body.
 * @returns {Promise<void>} - Envía el usuario creado o un mensaje de error.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username, phone, description, socialNetworks, photo } = req.body;
    const result = await authFB.registerAccount(username, email, password);
    if (!result.success) throw new ErrorAPI(result.error);

    const sendEmail = await authFB.sendEmailVerification();
    if (!sendEmail.success) throw new ErrorAPI(sendEmail.error);

    //first we need to upload the photo to firebase storage
    const photoUrl = await storageFB.uploadFile(`${email}/preview`, photo);
    if (!photoUrl.success) throw new ErrorAPI(photoUrl.error);

    //then we need to register the user credentials in firebase database
    const credentials = { phone, description, socialNetworks, photo: photoUrl.data };
    const register = await databaseFB.registerUserCredentials(result.data, credentials);
    if (!register.success) throw new ErrorAPI(register.error);

    send(res, 200, 'Usuario registrado exitosamente, se ha enviado un correo de verificación');
  } catch (e) { handlerResponse(res, e, 'registro de usuario') }
}
/**
 * Maneja el proceso de cierre de sesión del usuario.
 * @param {Request} req - Objeto de solicitud Express.
 * @returns {Promise<void>} - Envía un mensaje de éxito.
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    req.cookies.token && res.cookie('token', '', { maxAge: 0 });
    send(res, 200, 'Sesión cerrada exitosamente');
  } catch (e) { handlerResponse(res, e, 'cierre de sesión') }
}

/*---------------------------------------------------------------------------------------------------------*/

/*--------------------------------------------------tools--------------------------------------------------*/
/**
 * Establece las cookies de autenticación en la respuesta HTTP.
 * @param {Response} res - Objeto de respuesta Express.
 * @param {string} token - Token de autenticación a establecer en las cookies.
 */
export const setCookies = (res: Response, token: string) => {
  res.cookie('token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  })
}
/*---------------------------------------------------------------------------------------------------------*/