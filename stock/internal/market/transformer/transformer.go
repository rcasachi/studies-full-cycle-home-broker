package transformer

import (
	"github.com/rcasachi/home-broker/stock/internal/market/dto"
	"github.com/rcasachi/home-broker/stock/internal/market/entities"
)

func TransformInput(input dto.TradeInput) *entities.Order {
	asset := entities.NewAsset(input.AssetID, input.AssetID, 1000)
	investor := entities.NewInvestor(input.InvestorID)
	order := entities.NewOrder(input.OrderID, investor, asset, input.Shares, input.Price, input.OrderType)
	if input.CurrentShares > 0 {
		assetPosition := entities.NewInvestorAssetPosition(input.AssetID, input.CurrentShares)
		investor.AddAssetPosition(assetPosition)
	}
	return order
}

func TransformOutput(order *entities.Order) *dto.OrderOutput {
	output := &dto.OrderOutput{
		OrderID: order.ID,
		InvestorID: order.Investor.ID,
		AssetID: order.Asset.ID,
		OrderType: order.OrderType,
		Status: order.Status,
		Partial: order.PendingShares,
		Shares: order.Shares,
	}

	var transactionsOutput []*dto.TransactionOutput
	for _, transaction := range order.Transactions {
		transactionOutput := &dto.TransactionOutput{
			TransactionID: transaction.ID,
			BuyerID: transaction.BuyingOrder.Investor.ID,
			SellerID: transaction.SellingOrder.Investor.ID,
			AssetID: transaction.SellingOrder.Asset.ID,
			Price: transaction.Price,
			Shares: transaction.SellingOrder.Shares - transaction.SellingOrder.PendingShares,
		}
		transactionsOutput = append(transactionsOutput, transactionOutput)
	}
	output.TransactionOutput = transactionsOutput

	return output
}