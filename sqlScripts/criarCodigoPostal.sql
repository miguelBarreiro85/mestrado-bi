USE [electroPT]
GO

/****** Object:  Table [dbo].[codigo_postal]    Script Date: 09/05/2022 23:02:54 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[codigo_postal](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[CP4] [char](4) NOT NULL,
	[CP3] [char](3) NOT NULL,
	[designacao_postal] [varchar](150) NOT NULL,
	[id_concelho] [int] NOT NULL,
 CONSTRAINT [PK_codigo_postal] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[codigo_postal]  WITH CHECK ADD  CONSTRAINT [FK_codigo_postal_idconcelho] FOREIGN KEY([id_concelho])
REFERENCES [dbo].[concelho] ([id])
GO

ALTER TABLE [dbo].[codigo_postal] CHECK CONSTRAINT [FK_codigo_postal_idconcelho]
GO


