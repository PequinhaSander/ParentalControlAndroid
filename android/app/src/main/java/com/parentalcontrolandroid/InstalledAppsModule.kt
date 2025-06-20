package com.parentalcontrolandroid

import android.content.pm.PackageManager
import com.facebook.react.bridge.*
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = InstalledAppsModule.NAME)
class InstalledAppsModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  companion object {
    const val NAME = "InstalledApps"
  }

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun getInstalledApps(promise: Promise) {
    try {
      val pm = reactApplicationContext.packageManager
      val packages = pm.getInstalledApplications(PackageManager.GET_META_DATA)
      val result = Arguments.createArray()

      for (app in packages) {
        val appInfo = Arguments.createMap()
        appInfo.putString("packageName", app.packageName)
        val label = pm.getApplicationLabel(app).toString()
        appInfo.putString("appName", label)
        result.pushMap(appInfo)
      }

      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("ERROR", e.message)
    }
  }
}
