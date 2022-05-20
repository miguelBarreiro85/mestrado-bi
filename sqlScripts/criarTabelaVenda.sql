
USE [electroPT]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
IF  EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[venda]') AND type in (N'U'))
DROP TABLE [dbo].[venda]
GO

/****** Object:  Table [dbo].[categoria]    Script Date: 10/05/2022 08:20:11 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[venda](
	[id] [int] IDENTITY(1,1) NOT NULL,
    [id_pessoa] [int] NOT NULL,
	[data] [date] NOT NULL,
	[total] [float],
	[total_iva] [float],
	CONSTRAINT [PK_venda] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[venda]  WITH CHECK ADD  CONSTRAINT [FK_venda_idpessoa] FOREIGN KEY([id_pessoa])
REFERENCES [dbo].[pessoa] ([id])
GO

ALTER TABLE [dbo].[venda] CHECK CONSTRAINT [FK_venda_idpessoa]
GO