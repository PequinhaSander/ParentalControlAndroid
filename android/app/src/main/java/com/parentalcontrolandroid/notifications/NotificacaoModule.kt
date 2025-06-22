package com.parentalcontrolandroid.notifications

import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.service.notification.NotificationListenerService
import android.text.TextUtils
import com.facebook.react.bridge.*

class NotificacaoModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "NotificacaoRN"

    /** Verifica se a permissão está ativa */
    @ReactMethod
    fun isEnabled(promise: Promise) {
        val cnList = Settings.Secure.getString(
            reactContext.contentResolver,
            "enabled_notification_listeners"
        ) ?: ""
        val enabled = cnList.split(":")
            .any { it.contains(reactContext.packageName) }
        promise.resolve(enabled)
    }

    /** Abre a tela de configuração */
    @ReactMethod
    fun openSettings() {
        val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactContext.startActivity(intent)
    }
}
