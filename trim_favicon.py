from PIL import Image

def crop_image(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    # Get pixel data
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        # change all white (also shades of white)
        # to transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    
    # Get bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        # Crop the image
        img = img.crop(bbox)
    
    # Make it a square if it's not
    width, height = img.size
    if width != height:
        size = max(width, height)
        # Create a new square image with transparent background
        square_img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
        # Paste the cropped image in the center
        offset = ((size - width) // 2, (size - height) // 2)
        square_img.paste(img, offset)
        img = square_img
        
    img.save(output_path, "PNG")

if __name__ == "__main__":
    crop_image("public/favicon.png", "public/favicon.png")
