
package com.parentalcontrolandroid.modules

import android.Manifest
import android.content.pm.PackageManager
import android.database.Cursor
import android.provider.ContactsContract
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = ContatoModule.NAME)
class ContatoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        const val NAME = "ContatoModule"
    }

    override fun getName(): String {
        return NAME
    }

    @ReactMethod
    fun getContatos(promise: Promise) {
        val context = reactApplicationContext
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.READ_CONTACTS) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSAO_NEGADA", "Permissão de contatos negada")
            return
        }

        val contatos = Arguments.createArray()

        val cursor: Cursor? = context.contentResolver.query(
            ContactsContract.Contacts.CONTENT_URI,
            null, null, null, null
        )

        cursor?.use {
            while (it.moveToNext()) {
                val id = it.getString(it.getColumnIndexOrThrow(ContactsContract.Contacts._ID))
                val nome = it.getString(it.getColumnIndexOrThrow(ContactsContract.Contacts.DISPLAY_NAME))
                val temTelefone = it.getInt(it.getColumnIndexOrThrow(ContactsContract.Contacts.HAS_PHONE_NUMBER)) > 0

                val contato = Arguments.createMap()
                contato.putString("id", id)
                contato.putString("nome", nome)

                if (temTelefone) {
                    val telefonesCursor = context.contentResolver.query(
                        ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
                        null,
                        ContactsContract.CommonDataKinds.Phone.CONTACT_ID + " = ?",
                        arrayOf(id),
                        null
                    )

                    val telefones = Arguments.createArray()
                    telefonesCursor?.use { tc ->
                        while (tc.moveToNext()) {
                            val telefone = tc.getString(tc.getColumnIndexOrThrow(ContactsContract.CommonDataKinds.Phone.NUMBER))
                            telefones.pushString(telefone)
                        }
                    }
                    contato.putArray("telefones", telefones)
                }

                contatos.pushMap(contato)
            }
        }

        promise.resolve(contatos)
    }
}
