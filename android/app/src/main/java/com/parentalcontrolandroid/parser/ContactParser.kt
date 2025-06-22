package com.parentalcontrolandroid.parser

import java.text.Normalizer

class ContactParser {
    private val telRegex = Regex("""\+?\d{2}\s?\d{2}\s?\d{4,5}-?\d{4}""")

    fun parse(text: String): Pair<String, String> {
        val number = telRegex.find(text)?.value.orEmpty()
        val name = text.lineSequence()
            .firstOrNull { !telRegex.matches(it.trim()) }
            ?.let { Normalizer.normalize(it.trim(), Normalizer.Form.NFKD) }
            .orEmpty()
        return number to name
    }
}