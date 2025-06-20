package com.parentalcontrolandroid

import android.net.Uri
import android.util.Log
import com.facebook.react.bridge.*
import com.google.firebase.ktx.Firebase
import com.google.firebase.storage.FirebaseStorage
import com.google.firebase.storage.ktx.storage
import java.text.SimpleDateFormat
import java.util.*

class PhotosUploadModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val storage: FirebaseStorage = Firebase.storage

    override fun getName(): String {
        return "PhotosUpload"
    }

    @ReactMethod
    fun uploadPhoto(uriString: String, promise: Promise) {
        try {
            val uri = Uri.parse(uriString)
            val dateFormat = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())
            val fileName = "IMG_${dateFormat.format(Date())}.jpg"
            val storageRef = storage.reference.child("fotos/$fileName")

            val uploadTask = storageRef.putFile(uri)
            uploadTask.addOnSuccessListener {
                storageRef.downloadUrl.addOnSuccessListener { downloadUri ->
                    promise.resolve(downloadUri.toString())
                }.addOnFailureListener {
                    promise.reject("URL_ERROR", "Erro ao obter a URL da imagem")
                }
            }.addOnFailureListener {
                promise.reject("UPLOAD_ERROR", "Falha no upload: ${it.message}")
            }
        } catch (e: Exception) {
            promise.reject("EXCEPTION", "Erro: ${e.message}")
        }
    }
}
