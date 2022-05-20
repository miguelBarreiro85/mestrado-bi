
USE [electroPT]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[compra]') AND type in (N'U'))
DROP TABLE [dbo].[compra]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[compra](
	[id] [int] IDENTITY(1,1) NOT NULL,
    [id_fornecedor] [int] NOT NULL,
	[data] [date] NOT NULL,
	[total] [float],
	[total_iva] [float],
    [data_vencimento] [date] NOT NULL,
	CONSTRAINT [PK_compra] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[compra]  WITH CHECK ADD  CONSTRAINT [FK_compra_idfornecedor] FOREIGN KEY([id_fornecedor])
REFERENCES [dbo].[fornecedor] ([id])
GO

ALTER TABLE [dbo].[compra] CHECK CONSTRAINT [FK_compra_idfornecedor]
GO