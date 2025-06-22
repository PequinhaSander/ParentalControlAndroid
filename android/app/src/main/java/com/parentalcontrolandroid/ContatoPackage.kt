
package com.parentalcontrolandroid            

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.NativeModule
import com.facebook.react.uimanager.ViewManager
import com.parentalcontrolandroid.modules.ContatoModule
class ContatoPackage : ReactPackage {

    /** Não temos componentes de UI nativos. */
    override fun createViewManagers(reactContext: ReactApplicationContext)
            : List<ViewManager<*, *>> = emptyList()

    /** Devolvemos a lista de módulos nativos. */
    override fun createNativeModules(reactContext: ReactApplicationContext)
            : List<NativeModule> =
        listOf(ContatoModule(reactContext))
}
