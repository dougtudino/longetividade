import { prisma } from "./prisma";

// Busca URLs publicas de todas as imagens de um post, na ordem dos slides.
// Ex: [".../postId/0", ".../postId/1", ...]
// Retorna array vazio se o post nao tem nenhuma imagem renderizada.
export async function getPostImageUrls(postId: string): Promise<string[]> {
  const images = await prisma.socialPostImage.findMany({
    where: { postId },
    orderBy: { slideIndex: "asc" },
    select: { slideIndex: true },
  });

  if (images.length === 0) return [];

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://longetividade.com.br";
  return images.map((img) => `${baseUrl}/api/public/social-image/${postId}/${img.slideIndex}`);
}
