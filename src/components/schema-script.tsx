/**
 * SchemaScript Component
 *
 * Renders JSON-LD schema markup for SEO.
 * Can be used in any page to add structured data.
 */

type SchemaScriptProps = {
  schema: object | object[];
};

export function SchemaScript({ schema }: SchemaScriptProps) {
  const schemas = Array.isArray(schema) ? schema : [schema];

  return (
    <>
      {schemas.map((s, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
