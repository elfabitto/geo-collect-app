#!/usr/bin/env python3
"""
Script para gerar ícones PWA em diferentes tamanhos
Requer: pip install Pillow
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, output_path):
    """Cria um ícone com o tamanho especificado"""
    # Criar imagem com fundo azul
    img = Image.new('RGB', (size, size), color='#2563eb')
    draw = ImageDraw.Draw(img)
    
    # Adicionar um círculo branco no centro
    margin = size // 6
    circle_bbox = [margin, margin, size - margin, size - margin]
    draw.ellipse(circle_bbox, fill='white', outline='white')
    
    # Adicionar texto "GIS" no centro
    try:
        # Tentar usar uma fonte do sistema
        font_size = size // 3
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
            except:
                font = ImageFont.load_default()
    except:
        font = ImageFont.load_default()
    
    text = "GIS"
    
    # Calcular posição do texto para centralizar
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    text_x = (size - text_width) // 2
    text_y = (size - text_height) // 2 - bbox[1]
    
    # Desenhar texto
    draw.text((text_x, text_y), text, fill='#2563eb', font=font)
    
    # Salvar imagem
    img.save(output_path, 'PNG')
    print(f"✓ Ícone criado: {output_path} ({size}x{size})")

def main():
    """Função principal"""
    # Criar diretório de ícones se não existir
    icons_dir = 'public/icons'
    os.makedirs(icons_dir, exist_ok=True)
    
    # Tamanhos de ícones necessários para PWA
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    print("Gerando ícones PWA...")
    print("-" * 50)
    
    for size in sizes:
        output_path = os.path.join(icons_dir, f'icon-{size}x{size}.png')
        create_icon(size, output_path)
    
    print("-" * 50)
    print(f"✓ {len(sizes)} ícones gerados com sucesso!")
    print(f"✓ Ícones salvos em: {icons_dir}")
    print("\nPróximos passos:")
    print("1. Execute 'npm run build' para gerar o build de produção")
    print("2. Faça o deploy para testar a instalação do PWA")
    print("3. No navegador, você verá a opção 'Instalar aplicativo'")

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(f"Erro ao gerar ícones: {e}")
        print("\nCertifique-se de ter o Pillow instalado:")
        print("pip install Pillow")
