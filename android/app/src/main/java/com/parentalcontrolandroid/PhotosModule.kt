package com.parentalcontrolandroid

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.provider.MediaStore
import com.facebook.react.bridge.*
import java.util.*

class PhotosModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "PhotosModule"
    }

    @ReactMethod
    fun getPhotos(promise: Promise) {
        try {
            val photos = Arguments.createArray()
            val projection = arrayOf(
                MediaStore.Images.Media._ID,
                MediaStore.Images.Media.DISPLAY_NAME
            )

            val sortOrder = "${MediaStore.Images.Media.DATE_ADDED} DESC"

            val query = reactApplicationContext.contentResolver.query(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                projection,
                null,
                null,
                sortOrder
            )

            query?.use { cursor ->
                val idColumn = cursor.getColumnIndexOrThrow(MediaStore.Images.Media._ID)

                while (cursor.moveToNext()) {
                    val id = cursor.getLong(idColumn)
                    val contentUri: Uri = ContentUris.withAppendedId(
                        MediaStore.Images.Media.EXTERNAL_CONTENT_URI, id
                    )
                    photos.pushString(contentUri.toString())
                }
            }

            promise.resolve(photos)
        } catch (e: Exception) {
            promise.reject("ERRO_FOTOS", "Erro ao coletar fotos", e)
        }
    }
}
