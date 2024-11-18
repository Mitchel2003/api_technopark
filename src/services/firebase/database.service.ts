import { CollectionReference, getFirestore, collection, Firestore, setDoc, doc } from "firebase/firestore"
import { handlerService as handler } from "@/errors/handler"
import { Result } from "@/interfaces/api.interface";
import { UserCredential } from "firebase/auth"
import { firebaseApp } from "@/db"

/*--------------------------------------------------Database--------------------------------------------------*/
class DatabaseService {
  private static instance: DatabaseService
  private readonly db: Firestore
  private constructor() { this.db = getFirestore(firebaseApp) }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) { DatabaseService.instance = new DatabaseService() }
    return DatabaseService.instance
  }
  /**
   * Crea las credenciales de un usuario en la base de datos de firebase.
   * @param {UserCredential} auth - Contiene el usuario autenticado a registrar; en la propiedad "user" se encuentran sus datos.
   * @param {UserFB} credentials - Corresponde a las credenciales del usuario, contiene el rol del usuario en validacion.
   */
  async registerUserCredentials(auth: UserCredential, credentials: object): Promise<Result<void>> {
    return handler(async () => {
      await setDoc(doc(this.getCollection('users'), auth.user.uid), {
        ...credentials,
        email: auth.user.email,
        username: auth.user.displayName
      })
    }, 'crear usuario (Firebase Auth)')
  }
  /**
   * Obtiene una referencia a una subcolección desde la colección principal (auth).
   * La abreviatura de la colección es 'gs' (gestion_salud).
   * @param {string} name - El nombre de la subcolección a obtener.
   * @returns {CollectionReference} Una referencia a la subcolección.
  */
  getCollection(name: string): CollectionReference {
    return collection(this.db, 'technopark', 'auth', name)
  }
}
/*---------------------------------------------------------------------------------------------------------*/
export const databaseService = DatabaseService.getInstance()