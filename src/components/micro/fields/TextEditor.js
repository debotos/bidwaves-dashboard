import React, { useRef } from 'react'
import { useSafeState } from 'ahooks'
import { Editor } from '@tinymce/tinymce-react'

export function getFileBlobUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      resolve(reader.result)
    }

    reader.onerror = () => {
      reject(new Error('Error reading file.'))
    }

    reader.readAsDataURL(file)
  })
}

const RichTextEditor = ({ isRTL, id, onChange, placeholder, simple = true, ...rest }) => {
  const editorRef = useRef(null)
  const [isMounted, setIsMounted] = useSafeState(false)

  return (
    <Editor
      id={id}
      // eslint-disable-next-line no-undef
      apiKey={process.env.REACT_APP_TINY_MCE_KEY}
      onInit={(evt, editor) => (editorRef.current = editor)}
      init={{
        min_height: 160,
        height: 387,
        menubar: !simple,
        removed_menuitems: 'newdocument restoredraft code',
        statusbar: true,
        branding: false,
        toolbar_sticky: false,
        placeholder,
        promotion: false,
        content_css: '/tiny-mce.css',
        // newline_behavior: 'invert',
        toolbar_mode: 'sliding',
        browser_spellcheck: true,
        spellchecker_active: true,
        spellchecker_language: 'en_US',
        spellchecker_languages:
          'English (United States)=en_US,English (United Kingdom)=en_GB,Danish=da,French=fr,German=de,Italian=it,Polish=pl,Spanish=es,Swedish=sv',
        content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        contextmenu: false,
        plugins:
          'link image lists table media directionality preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link codesample table charmap pagebreak anchor insertdatetime advlist lists wordcount help emoticons',
        toolbar:
          'undo redo fontsizeinput lineheight forecolor backcolor bold italic underline strikethrough removeformat emoticons indent outdent alignleft aligncenter alignright alignjustify blocks bullist numlist blockquote image media mediaembed link table brButton hr charmap visualblocks searchreplace fullscreen' +
          `${window.location.origin.includes('localhost:') ? ' code preview' : ''}`,
        setup: editor => {
          editor.ui.registry.addButton('brButton', {
            text: 'BR',
            // image: '', // path
            tooltip: 'Insert Line Break',
            onAction: () => editor.execCommand('InsertLineBreak')
          })
        },
        directionality: isRTL ? 'rtl' : 'ltr',
        init_instance_callback: editor => {
          editor.on('focus', function () {
            setIsMounted(true)
          })
        },
        /* enable title field in the Image dialog */
        image_title: true,
        /* enable automatic uploads of images represented by blob or data URIs */
        automatic_uploads: true,
        file_picker_types: 'image',
        // file_picker_callback: function (cb, value, meta) {
        file_picker_callback: function (cb) {
          const input = document.createElement('input')
          input.setAttribute('type', 'file')
          input.setAttribute('accept', 'image/*')

          /*
				    Note: In modern browsers input[type="file"] is functional without
				    even adding it to the DOM, but that might not be the case in some older
				    or quirky browsers like IE, so you might want to add it to the DOM
				    just in case, and visually hide it. And do not forget do remove it
				    once you do not need it anymore.
				  */

          input.onchange = async function () {
            const file = this.files[0]

            try {
              const blobUrl = await getFileBlobUrl(file)
              // console.log('Blob URI:', blobUrl)
              /* call the callback and populate the Title field with the file name */
              cb(blobUrl, { title: file.name })
            } catch (error) {
              console.error(error)
            }
          }

          input.click()
        }
      }}
      onEditorChange={() => {
        if (isMounted && editorRef.current) {
          const value = editorRef.current.getContent()
          onChange(value)
        }
      }}
      {...rest}
    />
  )
}

export default RichTextEditor
