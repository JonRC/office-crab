import {
  Filter,
  GetProductsCommand,
  GetProductsCommandInput,
  PricingClient,
  paginateGetProducts,
} from "@aws-sdk/client-pricing";
import * as R from "ramda";
import { z } from "zod";

const pricingClient = new PricingClient({ region: "us-east-1" });

const ProductInfoSchemas = z.array(
  z.object({
    product: z.object({
      productFamily: z.string(),
      attributes: z.object({
        instanceType: z.string(),
      }),
    }),
    terms: z.object({
      OnDemand: z.record(
        z.string(),
        z.object({
          priceDimensions: z.record(
            z.string(),
            z.object({
              pricePerUnit: z.object({
                USD: z.coerce.number(),
              }),
            })
          ),
        })
      ),
    }),
  })
);

export const initGetInstancePrice = async (instanceTypes: string[]) => {
  const commandInput: GetProductsCommandInput = {
    ServiceCode: "AmazonEC2",
    Filters: [
      {
        Field: "productFamily",
        Type: "TERM_MATCH",
        Value: "Compute Instance",
      },
      {
        Field: "operatingSystem",
        Type: "TERM_MATCH",
        Value: "Linux",
      },
      {
        Field: "regionCode",
        Type: "TERM_MATCH",
        Value: "us-east-1",
      },
      {
        Field: "marketoption",
        Type: "TERM_MATCH",
        Value: "OnDemand",
      },
      {
        Field: "capacitystatus",
        Type: "TERM_MATCH",
        Value: "Used",
      },
      {
        Field: "preInstalledSw",
        Type: "TERM_MATCH",
        Value: "NA",
      },
      {
        Field: "tenancy",
        Type: "TERM_MATCH",
        Value: "Shared",
      },
    ],
    MaxResults: 100,
  };

  const resultProcesses = R.uniq(instanceTypes).map((instanceType) => {
    const command = new GetProductsCommand({
      ...commandInput,
      Filters: [
        ...commandInput.Filters!,
        {
          Field: "instanceType",
          Type: "TERM_MATCH",
          Value: instanceType,
        },
      ],
    });

    return pricingClient.send(command);
  });

  const productPrices = await Promise.all(resultProcesses)
    .then((results) =>
      results
        .map((result) => {
          if (!result.PriceList) return;

          const _productPrices = result.PriceList.map((priceString) => {
            if (!priceString) return null;
            if (typeof priceString !== "string")
              return priceString.deserializeJSON();
            return JSON.parse(priceString);
          });

          const productPrices = ProductInfoSchemas.parse(_productPrices);
          return productPrices;
        })
        .filter(R.isNotNil)
    )
    .then(R.flatten);

  const priceDictionary = productPrices.reduce((dic, productPrice) => {
    const instanceType = productPrice.product.attributes.instanceType;
    const onDemandPrice =
      productPrice.terms.OnDemand[Object.keys(productPrice.terms.OnDemand)[0]];

    const price =
      onDemandPrice.priceDimensions[
        Object.keys(onDemandPrice.priceDimensions)[0]
      ].pricePerUnit.USD;

    dic[instanceType] = price;

    return dic;
  }, {} as Record<string, number | undefined>);

  return (instanceType: string) => priceDictionary[instanceType];
};
