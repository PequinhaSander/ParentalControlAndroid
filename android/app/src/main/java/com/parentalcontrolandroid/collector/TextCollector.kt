package com.parentalcontrolandroid.collector

import android.view.accessibility.AccessibilityNodeInfo

class TextCollector {
    fun collect(node: AccessibilityNodeInfo): String = buildString {
        traverse(node)
    }

    private fun StringBuilder.traverse(node: AccessibilityNodeInfo?) {
        if (node == null) return
        node.text?.let { append(it).append('\n') }
        for (i in 0 until node.childCount) {
            traverse(node.getChild(i))
        }
    }

    fun detectMedia(text: String): Boolean =
        listOf("imagem", "áudio").any { text.contains(it, ignoreCase = true) }
}