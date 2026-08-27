WITH review_aggregates AS (
	SELECT
		"productId",
		AVG(rating)::double precision AS average_rating,
		COUNT(*)::int AS review_count
	FROM "Review"
	GROUP BY "productId"
)
UPDATE "Product" AS p
SET
	"averageRating" = COALESCE(ra.average_rating, 0),
	"reviewCount" = COALESCE(ra.review_count, 0)
FROM review_aggregates AS ra
WHERE p.id = ra."productId";

UPDATE "Product" AS p
SET
	"averageRating" = 0,
	"reviewCount" = 0
WHERE NOT EXISTS (
	SELECT 1
	FROM "Review" AS r
	WHERE r."productId" = p.id
);
