USE [electroPT]
GO

/****** Object:  Table [dbo].[concelho]    Script Date: 09/05/2022 22:57:33 ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[categoria](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[designacao] [varchar](50) NOT NULL,
	[id_categoria_pai] [int] NOT NULL,
 CONSTRAINT [PK_categoria] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[categoria]  WITH CHECK ADD  CONSTRAINT [FK_categoria_id_categoria_pai] FOREIGN KEY([id_categoria])
REFERENCES [dbo].[categoria] ([id])
GO

ALTER TABLE [dbo].[categoria] CHECK CONSTRAINT [FK_categoria_id_categoria_pai]
GO

