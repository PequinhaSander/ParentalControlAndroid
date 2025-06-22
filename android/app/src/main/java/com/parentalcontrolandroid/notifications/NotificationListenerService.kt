package com.parentalcontrolandroid.notifications

import android.provider.Settings
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.Timestamp    // ⬅ para gravar horário

class NotificationListenerService : NotificationListenerService() {

    private val db by lazy { FirebaseFirestore.getInstance() }

    /** Android-ID (mesmo usado no JS) */
    private fun getAndroidId(): String =
        Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)

    /** Disparo opcional p/ React Native */
    private fun sendEventToRN(pkg: String, title: String?, text: String?) {
        (applicationContext as? ReactApplicationContext)
            ?.getJSModule(RCTDeviceEventEmitter::class.java)
            ?.emit(
                "NovaNotificacao",
                mapOf("package" to pkg, "title" to title, "text" to text)
            )
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val pkg    = sbn.packageName                   // ex.: com.whatsapp
        val extras = sbn.notification.extras
        val title  = extras.getString("android.title")
        val text   = extras.getCharSequence("android.text")?.toString()

        /* ─── Filtra apenas WhatsApp (ou comente p/ aceitar todos) ─── */
        if (pkg != "com.whatsapp" || text.isNullOrBlank()) return

        /* ─── Monta payload ─── */
        val dados = hashMapOf(
            "package"   to pkg,
            "title"     to (title ?: "—"),
            "text"      to text,
            "timestamp" to Timestamp.now()
        )

        /* ─── Grava em  /dispositivos/{androidId}/notificacoes  ─── */
        db.collection("dispositivos")
          .document(getAndroidId())
          .collection("notificacoes")
          .add(dados)

        /* opcional: evento live p/ RN */
        sendEventToRN(pkg, title, text)
    }
}
