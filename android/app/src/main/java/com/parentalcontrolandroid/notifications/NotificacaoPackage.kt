package com.parentalcontrolandroid.notifications

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class NotificacaoPackage : ReactPackage {
    override fun createNativeModules(rc: ReactApplicationContext): List<NativeModule> =
        listOf(NotificacaoModule(rc))

    override fun createViewManagers(rc: ReactApplicationContext): List<ViewManager<*, *>> =
        emptyList()
}
