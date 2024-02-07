import streamlit as st
import pytesseract
from PIL import Image

st.set_page_config(page_title='OCR App')

pytesseract.pytesseract.tesseract_cmd = '/opt/homebrew/bin/tesseract'
uploaded_file = st.file_uploader('Upload an image', type=['png', 'jpg', 'jpeg'])

ocr_text = ""
if st.button('Perform OCR'):
  if uploaded_file is not None:
    with st.spinner("Extracting OCR..."):
      image = Image.open(uploaded_file)
      st.image(image)
      text = pytesseract.image_to_string(image)
      st.subheader("OCR Text")
      with st.expander("See OCR Results"):
        st.write(text)
        ocr_text = text


