package com.parentalcontrolandroid.remote

import android.util.Log
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await
import java.util.concurrent.ConcurrentLinkedQueue

class FirestoreManager {
    private val db = FirebaseFirestore.getInstance()
    private val cache = ConcurrentLinkedQueue<Conversation>()

    data class Conversation(
        val text: String,
        val lastMessage: String,
        val hasMedia: Boolean,
        val contactNumber: String,
        val contactName: String,
        val date: String
    )

    suspend fun saveConversation(deviceId: String, convo: Conversation) {
        val path = db.collection("dispositivos")
            .document(deviceId)
            .collection("conversas")
            .document(convo.contactNumber)
            .collection(convo.date)
        val document = mapOf(
            "texto"          to convo.text,
            "timestamp"      to Timestamp.now(),
            "ultimaMensagem" to convo.lastMessage,
            "possuiMidia"    to convo.hasMedia,
            "contatoNumero"  to convo.contactNumber,
            "contatoNome"    to convo.contactName
        )
        try {
            val result = path.add(document).await()
            Log.i(TAG, "Document saved with ID: ${result.id}")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save document", e)
            cache.add(convo)
            throw e
        }
    }

    fun cacheConversation(convo: Conversation) {
        cache.add(convo)
    }

    suspend fun flushCache(deviceId: String) {
        while (cache.isNotEmpty()) {
            val convo = cache.poll() ?: continue
            saveConversation(deviceId, convo)
        }
    }

    companion object {
        private const val TAG = "FirestoreManager"
    }
}
