// ConversasAccessibilityService.kt
package com.parentalcontrolandroid.service

import android.accessibilityservice.AccessibilityService
import android.provider.Settings
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.parentalcontrolandroid.collector.TextCollector
import com.parentalcontrolandroid.parser.ContactParser
import com.parentalcontrolandroid.remote.FirestoreManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.ZoneId
import java.time.format.DateTimeFormatter

class ConversasAccessibilityService : AccessibilityService() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val collector = TextCollector()
    private val parser = ContactParser()
    private val firestore = FirestoreManager()
    private val dateFormatter = DateTimeFormatter.ISO_LOCAL_DATE

    override fun onServiceConnected() {
        super.onServiceConnected()
        Log.i(TAG, "Accessibility service connected")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.packageName?.toString() != WHATSAPP_PACKAGE) return

        val root = event.source ?: return
        val texto = collector.collect(root)
        if (texto.isBlank()) return

        val (number, name) = parser.parse(texto)
        val dateStr = LocalDate.now(ZoneId.systemDefault()).format(dateFormatter)

        val convo = FirestoreManager.Conversation(
            text          = texto,
            lastMessage   = texto.lineSequence().lastOrNull()?.trim().orEmpty(),
            hasMedia      = collector.detectMedia(texto),
            contactNumber = number.ifBlank { UNKNOWN_CONTACT },
            contactName   = name,
            date          = dateStr
        )

        scope.launch {
            try {
                firestore.saveConversation(retrieveDeviceId(), convo)
                Log.d(TAG, "Saved conversation for $number on $dateStr")
            } catch (e: Exception) {
                Log.e(TAG, "Error saving conversation: ${e.message}", e)
                firestore.cacheConversation(convo)
            }
        }
    }

    override fun onInterrupt() {
        Log.i(TAG, "Service interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }

    private fun retrieveDeviceId(): String =
        Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)

    companion object {
        private const val TAG = "ConversasService"
        private const val WHATSAPP_PACKAGE = "com.whatsapp"
        private const val UNKNOWN_CONTACT = "desconhecido"
    }
}

