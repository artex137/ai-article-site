import UploadForm from "@/components/UploadForm";

export const metadata = { title: "Upload | AI Article Site" };

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold mb-4">Create a new article</h1>
      <p className="text-gray-600 mb-6">
        Upload an image and/or paste text. I’ll infer your intent, research if needed,
        write a clean article, generate a lead image, and publish it.
      </p>
      <UploadForm />
    </div>
  );
}
